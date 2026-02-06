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
  file: File | null;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
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
    <div className="flex h-full flex-col items-center">
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
            <div className="mt-10 text-red-500">
              PDF 加载失败，请检查文件是否损坏。
            </div>
          }
          className="shadow-lg"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={600} // 固定宽度或根据容器调整
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
