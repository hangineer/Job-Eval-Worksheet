function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto w-full px-6 py-2">
        <div>
          <img src="/img/logo.svg" alt="CareerCal" className="h-14" />
          <h1 className="sr-only">轉換工作評估工具 CareerCal</h1>
          <p className="text-sm text-gray-500">
            幫助你系統性評估工作機會，做出更明智的決策
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;