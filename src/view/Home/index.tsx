import { Button } from "antd";
import { useDispatch } from "react-redux";
import { changeList } from "@/store/modules/upload";

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
      "replace"
    ));
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddToList}>
        修改List
      </Button>
    </div>
  );  
};

export default Home;
