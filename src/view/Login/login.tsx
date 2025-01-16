import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home");
  };

  return (
    <div>
      <h1>login</h1>
      <h2>这个上login页面</h2>
      <Button type="primary" onClick={handleClick}>
        这个是登录页切换为ts成功
      </Button>
    </div>
  );
};
export default Login;
