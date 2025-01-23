const Welcome: React.FC = () => {
  const handleClick = () => {
    getFetchSse().then(async ({ reader, decoder }) => {
      // 循环读取流数据
      let done = false;
      let buffer = "";
      while (!done) {
        // 读取流中的一部分
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!done) {
          const parsedMessage = JSON.parse(
            decoder.decode(value, { stream: true })
          );
          console.log({ value: parsedMessage, status: done }); // 输出每次的内容
          buffer += parsedMessage.message;
        } else {
          console.log(buffer);
        }
      }
    });
  };
  return (
    <div>
      <h1 className="text-pink-400">Welcome Hiresphere</h1>
      <h2></h2>
      <p>欢迎大家使用！Welcome to Hiresphere</p>
    </div>
  );
};
export default Welcome;
