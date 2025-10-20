const Page = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h1>
        {children}
    </div>
);

const AsistenciaPage = () => <Page title="Asistencia Virtual"><p>Interactúa con nuestro asistente virtual para resolver tus dudas.</p></Page>;

export default AsistenciaPage;