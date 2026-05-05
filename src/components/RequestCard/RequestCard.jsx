import './RequestCard.css';

const RequestCard = ({ request, onClick }) => {
  const handleSaveClick = (e) => {
    e.stopPropagation();
    // TODO: Implement save functionality
    console.log('Save request:', request.id);
  };

  return (
    <div className="r-job-card" onClick={() => onClick(request.id)}>
      <div className="r-job-header">
        <h3 className="r-job-title">{request.title}</h3>
        <button className="r-save-btn" onClick={handleSaveClick}>
          <i className="fa-regular fa-heart"></i>
        </button>
      </div>

      <div className="r-job-meta">
        <span className="r-meta-item">
          <i className="fa-solid fa-tag"></i> {request.category}
        </span>
        <span className="r-meta-item">
          <i className="fa-solid fa-clock"></i> {request.postedTime}
        </span>
        {request.location && (
          <span className="r-meta-item">
            <i className="fa-solid fa-location-dot"></i> {request.location}
          </span>
        )}
      </div>

      <p className="r-job-desc">{request.description}</p>

      <div className="r-job-skills">
        {request.skills.map((skill, index) => (
          <span key={index} className="r-skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="r-job-footer">
        <div className="r-job-info">
          <span className="r-budget">
            <i className="fa-solid fa-money-bill-wave"></i> {request.budget}
          </span>
          <span className="r-deadline">
            <i className="fa-solid fa-calendar-days"></i> {request.deadline}
          </span>
        </div>
        <div className="r-bids">
          <i className="fa-solid fa-users"></i> {request.bids} đề xuất
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
