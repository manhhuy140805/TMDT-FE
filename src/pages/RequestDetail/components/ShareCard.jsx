const ShareCard = () => {
  return (
    <div className="c-share d-card" style={{padding: '20px'}}>
      <p>Chia sẻ dự án:</p>
      <div className="c-share-links">
        <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
        <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
        <a href="#"><i className="fa-solid fa-link"></i></a>
      </div>
    </div>
  );
};

export default ShareCard;
