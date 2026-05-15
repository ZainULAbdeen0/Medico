const EmptyState = ({ title, description, action, className = "" }) => {
    return (
        <div
            className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
        >
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description ? (
                <p className="mt-1 max-w-md text-sm text-gray-500">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
};

export default EmptyState;
