import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Pagination } from 'antd';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// 设置 worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfPreviewProps {
  file: File | string | null;
  width?: number;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ file, width }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        暂无预览文件
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center w-full">
      <div className="flex min-h-[500px] w-full flex-1 justify-center overflow-auto rounded bg-gray-100 p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-64 items-center justify-center">
              <Spin tip="PDF 加载中..." />
            </div>
          }
          error={
            <div className="mt-10 flex flex-col items-center text-red-500 gap-2">
              <span>PDF 加载失败</span>
              <span className="text-xs text-gray-400">(可能是跨域或文件损坏)</span>
            </div>
          }
          className="shadow-lg"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false} // 禁用文本层以优化性能和避免对齐问题
            renderAnnotationLayer={false} // 禁用注解层
            width={width || 600} // 使用传入的宽度或默认值
            className="bg-white"
          />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="mt-4 rounded border bg-white p-2 shadow-sm">
          <Pagination
            simple
            current={pageNumber}
            total={numPages}
            pageSize={1}
            onChange={(page) => setPageNumber(page)}
          />
          <div className="mt-1 text-center text-xs text-gray-400">
            共 {numPages} 页
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
