function AgendaCard({ rows }) {
  if (!rows?.length) return null;

  return (
    <div className="space-y-4">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 font-serif"
          aria-label={`Agenda item ${idx + 1}`}
        >
          <div style={{ backgroundColor: '#8f5a39' }} className="px-6 py-3">
            <div className="text-white font-semibold">
              {row.time}
            </div>
          </div>
          <div className="p-6 space-y-3" style={{ backgroundColor: '#f4efe7' }}>
            {Object.entries(row).map(([key, value]) => {
              if (key === 'time') return null;
              return (
                <div key={key} className="flex">
                  <dt
                    className="text-sm font-semibold uppercase tracking-wider w-1/3 flex-shrink-0"
                    style={{ color: '#8f5a39' }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </dt>
                  <dd className="text-sm text-gray-900 w-2/3 break-words">
                    {value}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgendaCard;