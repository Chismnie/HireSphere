import { Button } from "antd";
// import { useDispatch } from "react-redux";
// import { changeList } from "@/store/modules/upload";
import { uploadPdf, uploadImage ,upload} from "@/apis/api";
import { clearRequestQueue } from "@/utils/request";
// import { fileToReduxFormat } from "@/utils/common";
const Home: React.FC = () => {
  // const dispatch = useDispatch();
let index=1
  const handleAddToList = () => {
    index++;
    // dispatch(changeList(
    //   [
    //     {
    //       type: "up",
    //       data: index,
    //     },
    //   ],
    // ));
    upload(index).then(res => {
      console.log(res);
    });
  };


  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // const uploadList = fileArray.map(file => ({
      //   type: "pdf" as const,
      //   data: file
      // }));
      // dispatch(changeList(uploadList));
      fileArray.forEach(file => {
        uploadPdf(file).then(res => {
          console.log(res);
        });
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // dispatch(changeList([{ type: "img", data:file }]));
      uploadImage(file).then(res => {
        console.log(res);
      });
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddToList}>
        修改List
      </Button>
      <Button type="primary" onClick={clearRequestQueue}>
        清除队列
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
