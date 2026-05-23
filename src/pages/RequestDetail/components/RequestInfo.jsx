const FILE_ICONS = {
  pdf: 'fa-file-pdf', word: 'fa-file-word', document: 'fa-file-word',
  excel: 'fa-file-excel', spreadsheet: 'fa-file-excel',
  powerpoint: 'fa-file-powerpoint', presentation: 'fa-file-powerpoint',
  image: 'fa-file-image', video: 'fa-file-video', audio: 'fa-file-audio',
  zip: 'fa-file-zipper', rar: 'fa-file-zipper', compressed: 'fa-file-zipper',
  figma: 'fa-file-code',
};
const getFileIcon = (type = '') => {
  const t = type.toLowerCase();
  return Object.entries(FILE_ICONS).find(([k]) => t.includes(k))?.[1] ?? 'fa-file';
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const RequestInfo = ({ request }) => (
  <div className="rd-card">
    {/* Meta chips */}
    <div className="rd-meta-chips">
      <span className="rd-chip">
        <i className="fa-solid fa-fingerprint"></i>
        ID: <strong>#{request.id}</strong>
      </span>
      {request.category && (
        <span className="rd-chip">
          <i className="fa-solid fa-briefcase"></i> {request.category}
        </span>
      )}
      <span className="rd-chip">
        <i className="fa-solid fa-location-dot"></i> {request.location}
      </span>
      <span className="rd-chip">
        <i className="fa-regular fa-calendar"></i>
        Hạn: <strong>{formatDate(request.deadline)}</strong>
      </span>
    </div>

    {/* Description */}
    <h3 className="rd-card-title">
      <i className="fa-solid fa-align-left"></i> Mô tả công việc
    </h3>
    <div className="rd-desc">{request.description}</div>

    <hr className="rd-divider" />

    {/* Skills */}
    <h3 className="rd-card-title">
      <i className="fa-solid fa-code"></i> Kỹ năng yêu cầu
    </h3>
    {request.skills?.length > 0 ? (
      <div className="rd-skill-list">
        {request.skills.map((s, i) => (
          <span key={i} className="rd-skill">{s}</span>
        ))}
      </div>
    ) : (
      <p className="rd-empty-text">Không có kỹ năng cụ thể được yêu cầu</p>
    )}

    <hr className="rd-divider" />

    {/* Attachments */}
    <h3 className="rd-card-title">
      <i className="fa-solid fa-paperclip"></i> Tài liệu đính kèm
    </h3>
    {request.attachments?.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {request.attachments.map((file, i) => (
          <div key={i} className="rd-attach-item">
            <i className={`fa-solid ${getFileIcon(file.type)}`}></i>
            <div className="rd-attach-info">
              <a href={file.url} download>{file.name}</a>
              <span>{file.size}</span>
            </div>
            <button className="rd-attach-dl" onClick={() => window.open(file.url, '_blank')}>
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="rd-empty-text">Không có tài liệu đính kèm</p>
    )}
  </div>
);

export default RequestInfo;
