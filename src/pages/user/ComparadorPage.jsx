const Page = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h1>
        {children}
    </div>
);

const ComparadorPage = () => <Page title="Comparador"><p>Compara diferentes productos de seguros y pensiones del mercado.</p></Page>;

export default ComparadorPage;