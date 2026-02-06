import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (role: 'seeker' | 'hr') => {
    navigate('/login', { state: { preselect: role } });
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }} // 背景图片
    >
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center gap-3 px-6 py-5">
          <img
            src="/logo-ai.png" // logo 图片
            alt="HireSphere"
            className="h-10 w-10 rounded-md shadow-sm"
          />
          <span className="text-2xl font-semibold tracking-wide text-gray-900">
            HireSphere
          </span>
        </header>

        <main className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white/80 p-10 shadow-lg">
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              欢迎来到 HireSphere
            </h1>
            <p className="mb-8 leading-relaxed text-gray-600">
              利用 AI 提升招聘效率，为 HR
              端提供智能分析与辅助决策，为求职者端提供模拟面试与能力提升，
              实现招聘与求职的双向智能化。
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
              <button
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-white shadow-sm transition-colors hover:bg-blue-700"
                onClick={() => handleSelect('seeker')}
              >
                开始使用
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              选择后将进入登录页面；如选择错误，可返回重新选择。
            </p>
          </div>
        </main>

        <footer className="px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} HireSphere. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
