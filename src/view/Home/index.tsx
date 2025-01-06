import { Button } from "antd";
import { useDispatch } from "react-redux";
import { changeList } from "@/store/modules/upload";
// import { fileToReduxFormat } from "@/utils/common";
const Home: React.FC = () => {
  const dispatch = useDispatch();
let index=1
  const handleAddToList = () => {
    index++;
    dispatch(changeList(
      [
        {
          type: "up",
          data: index,
        },
      ],

    ));
  };


  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const uploadList = fileArray.map(file => ({
        type: "pdf" as const,
        data: file
      }));
      dispatch(changeList(uploadList));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(changeList([{ type: "img", data:file }]));
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddToList}>
        修改List
      </Button>
      上传文件，限制为img
      {/* 上传文件，限制为img和pdf */}
      <input type="file" accept="image/*,application/pdf" onChange={handleImageChange} />
      {/* 上传文件，限制为pdf */}
      上传文件，限制为pdf
      <input type="file" accept="application/pdf" onChange={handlePdfChange} multiple />
    </div>
  );  
};

export default Home;
