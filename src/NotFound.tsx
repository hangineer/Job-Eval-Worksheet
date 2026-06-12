import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-gray-50">
      <p className="text-6xl font-bold text-green-700 mb-3">Page Not Found</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">找不到這個頁面</h1>
      <p className="text-gray-600 mb-6">您輸入的網址不存在或已被移除。</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800"
      >
        回到評估表
      </Link>
    </div>
  );
}
