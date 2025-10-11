function AgendaTable({ rows }) {
  if (!rows?.length) return null;

  // Get all unique keys from the rows for table headers
  const headers = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg bg-white font-serif">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr style={{ backgroundColor: '#8f5a39' }}>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
              >
                {header.charAt(0).toUpperCase() + header.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, idx) => (
                        <tr 
              key={idx}
              className="hover:bg-[#f4efe7] transition-colors duration-150 ease-in-out"
              style={{ 
                backgroundColor: idx % 2 === 0 ? 'white' : '#f4efe7'
              }}>
              {headers.map((header) => (
                <td
                  key={`${idx}-${header}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    header === 'time' ? 'font-medium' : 
                    header === 'session' ? 'font-medium text-gray-900' :
                    'text-gray-500'
                  }`}
                  style={header === 'time' ? { color: '#8f5a39' } : undefined}
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgendaTable;