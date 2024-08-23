import { type NodeProps } from 'reactflow';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useDocument } from '@/lib/reactquery/useDocument';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};
   
export default function PIDNode({ data } : NodeProps){
  const { data: fdata } = useDocument(data.docId);

  const isValidPdf = fdata && fdata.fdata && fdata.ftype === "application/pdf"

  return (
    <>
        <div
          style={{
            height: data.height,
            width: data.width,
            backgroundColor: "white",
          }}>
            { isValidPdf && <Document file={fdata.fdata} options={options} className="w-[100%] h-full overflow-hidden -z-10">
                <Page
                    key={`page_${1}`}
                    pageNumber={1}
                    height={data.height}
                />
            </Document> }
            { !isValidPdf && fdata && <img src={URL.createObjectURL(fdata.fdata)} alt="Blob" className="w-min h-min" /> }
        </div>
    </>
  );
};
