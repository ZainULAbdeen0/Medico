const StatCard = ({ title, value, caption }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {title}
            </div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
                {value}
            </div>
            {caption ? (
                <div className="mt-1 text-xs text-gray-500">{caption}</div>
            ) : null}
        </div>
    );
};

export default StatCard;
