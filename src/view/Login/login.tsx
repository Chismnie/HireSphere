import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home");
  };

  return (
    <div>
      <Button type="primary" onClick={handleClick}>
        这个是登录页切换为ts成功
      </Button>
    </div>
  );
};
export default Login;
