'use client';

import { useState, useCallback, useRef } from 'react';

// 扩展支持的图片格式
type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'bmp' | 'gif' | 'tiff';

// 格式配置
const FORMAT_CONFIG = [
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
  { value: 'jpg', label: 'JPG', mimeType: 'image/jpeg' },
  { value: 'png', label: 'PNG', mimeType: 'image/png' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp' },
  { value: 'bmp', label: 'BMP', mimeType: 'image/bmp' },
  { value: 'gif', label: 'GIF', mimeType: 'image/gif' },
  { value: 'tiff', label: 'TIFF', mimeType: 'image/tiff' },
];

const TransitionPage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (result) {
        // 先重置所有状态
        setOutputImage(null);
        setConvertedSize(0);

        // 然后设置新的图片
        setImage(result);
        setOriginalFormat(file.type.split('/')[1].toUpperCase());
        setOriginalSize(file.size);
      }
    };

    reader.readAsDataURL(file);
  }, []);

  // 处理图片转换
  const handleConvert = async () => {
    if (!image || !imageRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 canvas context');

      // 对于某些特殊格式，可能需要特殊处理
      if (outputFormat === 'gif' || outputFormat === 'tiff') {
        alert(`注意：转换为 ${outputFormat.toUpperCase()} 格式可能会失去动画效果`);
      }

      ctx.drawImage(imageRef.current, 0, 0);

      // 获取对应的 MIME 类型
      const mimeType =
        FORMAT_CONFIG.find((f) => f.value === outputFormat)?.mimeType || `image/${outputFormat}`;

      // 转换图片
      const convertedImage = canvas.toDataURL(mimeType, quality / 100);
      setOutputImage(convertedImage);

      // 计算转换后的大小
      const convertedSize = Math.round(convertedImage.length * 0.75);
      setConvertedSize(convertedSize);

      // 显示压缩信息
      const compressionRate = (((originalSize - convertedSize) / originalSize) * 100).toFixed(1);
      console.log(`原始大小: ${formatFileSize(originalSize)}`);
      console.log(`转换后大小: ${formatFileSize(convertedSize)}`);
      console.log(`压缩率: ${compressionRate}%`);
    } catch (error) {
      console.error('转换失败:', error);
      alert('图片转换失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 处理下载
  const handleDownload = useCallback(() => {
    if (!outputImage) return;

    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `converted.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [outputImage, outputFormat]);

  // 添加拖拽处理函数
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];

      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 修改 resetAll 函数
  const resetAll = useCallback(() => {
    setImage(null);
    setOutputImage(null);
    setOriginalSize(0);
    setConvertedSize(0);
    setOriginalFormat('');
    setIsProcessing(false);
    setQuality(80);
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#0B1120] to-[#0B1120]/90 -z-10" />
      <main className="min-h-screen w-full py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* 标题区域 - 增加渐变和动画效果 */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text bg-[size:400%] animate-gradient">
                图片格式转换工具
              </span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto animate-fade-in-up">
              支持多种格式转换和质量压缩，快速获得最优图片。
            </p>
          </div>

          {/* 图片区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* 上传区域 */}
            <div
              className="relative h-[600px] bg-[#1a2234]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all group hover:border-blue-500/20"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {!image && (
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="imageUpload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
              )}
              <label
                htmlFor={!image ? 'imageUpload' : undefined}
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              >
                {image ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      ref={imageRef}
                      src={image}
                      alt="原始图片"
                      className="max-w-full max-h-full object-contain"
                    />
                    {originalSize > 0 && (
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/10">
                        格式: {originalFormat} | 大小: {formatFileSize(originalSize)}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        resetAll();
                      }}
                      className="absolute bottom-4 right-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl backdrop-blur-sm border border-red-500/20 transition-all"
                    >
                      清除图片
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 rounded-full bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-white/10">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-lg font-medium mb-1">拖放或点击上传图片</p>
                      <p className="text-gray-500 text-sm">支持 JPG、PNG、WebP 等格式</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* 预览区域 */}
            <div className="h-[600px] bg-[#1a2234]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              {outputImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={outputImage}
                    alt="转换后的图片"
                    className="max-w-full max-h-full object-contain"
                  />
                  {convertedSize > 0 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/10">
                      大小: {formatFileSize(convertedSize)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="p-6 rounded-full bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-white/10 mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">
                    {isProcessing ? '处理中...' : '转换后的图片预览'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 控制器 - 添加上下边距的容器 */}
          <div className="py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* 格式选择 */}
                <div className="bg-[#1a2234]/50 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-4 border border-white/5 w-full sm:w-auto">
                  <span className="text-gray-400 font-medium">格式</span>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
                    className="w-[140px] bg-[#242c3e] text-white rounded-lg px-3 py-2 outline-none border border-white/5 hover:border-blue-500/30 focus:border-blue-500/50 transition-colors appearance-none"
                  >
                    {FORMAT_CONFIG.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 质量控制 */}
                <div className="bg-[#1a2234]/50 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-4 border border-white/5 w-full sm:w-auto">
                  <span className="text-gray-400 font-medium">质量</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-32 accent-blue-500"
                    />
                    <div className="w-[52px] bg-[#242c3e] px-2 py-1 rounded-lg border border-white/5">
                      <span className="text-white text-sm font-medium text-center block">
                        {quality}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 w-full sm:w-auto"
                  disabled={!image || isProcessing}
                  onClick={handleConvert}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>处理中...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>转换图片</span>
                    </>
                  )}
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95 w-full sm:w-auto"
                  onClick={resetAll}
                  disabled={!image}
                >
                  清除
                </button>
                {outputImage && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    下载
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 底部留白 */}
          <div className="h-16 md:h-20"></div>
        </div>
      </main>
    </>
  );
};

export default TransitionPage;
