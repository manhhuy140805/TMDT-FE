const RequestInfo = ({ request }) => {
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('video')) return 'fa-file-video';
    if (fileType.includes('audio')) return 'fa-file-audio';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'fa-file-zipper';
    if (fileType.includes('figma')) return 'fa-file-code';
    return 'fa-file';
  };

  return (
    <div className="d-card">
      {/* Meta Row */}
      <div className="d-meta-row">
        <div className="d-meta-item">
          <i className="fa-solid fa-fingerprint"></i> ID: <strong style={{color: 'var(--navy)'}}>{request.id}</strong>
        </div>
        <div className="d-meta-item">
          <i className="fa-solid fa-location-dot"></i> <span>{request.location}</span>
        </div>
        <div className="d-meta-item">
          <i className="fa-solid fa-briefcase"></i> <span>{request.category}</span>
        </div>
        <div className="d-meta-item" style={{marginLeft: 'auto'}}>
          <i className="fa-regular fa-clock"></i> <span>Đăng {request.postedTime}</span>
        </div>
      </div>

      <h3 className="d-section-title">Mô tả công việc chi tiết</h3>
      <div className="d-desc">
        <p>{request.description}</p>
      </div>

      <hr style={{border: 'none', borderTop: '1px solid var(--border-light)', margin: '30px 0'}} />

      <h3 className="d-section-title">Kỹ năng chuyên môn yêu cầu</h3>
      <div className="large-tags">
        {request.skills.map((skill, index) => (
          <span key={index} className="job-tag outline">{skill}</span>
        ))}
      </div>

      <hr style={{border: 'none', borderTop: '1px solid var(--border-light)', margin: '30px 0'}} />

      <h3 className="d-section-title">Tài liệu đính kèm</h3>
      {request.attachments && request.attachments.length > 0 ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {request.attachments.map((file, index) => (
            <div key={index} className="attach-item">
              <i className={`fa-solid ${getFileIcon(file.type)}`}></i>
              <div className="attach-info">
                <a href={file.url} download>{file.name}</a>
                <span>{file.size}</span>
              </div>
              <button 
                style={{border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', fontSize: '20px'}}
                onClick={() => window.open(file.url, '_blank')}
              >
                <i className="fa-solid fa-download"></i>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{color: '#94A3B8', fontSize: '14px', fontStyle: 'italic'}}>
          Không có tài liệu đính kèm
        </p>
      )}
    </div>
  );
};

export default RequestInfo;
