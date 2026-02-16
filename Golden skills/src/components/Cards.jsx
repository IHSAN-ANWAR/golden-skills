import './Cards.css';
import earnRewardImg from '../assets/earn reward.png';
import newSkillImg from '../assets/new skill.png';
import workTaskImg from '../assets/work on real task.png';

const Cards = () => {
  return (
    <section className="cards-section">
      <div className="container-fluid">
        {/* Section Header */}
        <div className="row">
          <div className="col-12 text-center">
            <div className="section-title-with-line">
              <div className="title-line"></div>
              <h2 className="cards-title">Learn. <span className="gradient-text">Earn.</span> <span className="gradient-text">Excel.</span></h2>
              <div className="title-line"></div>
            </div>
            <p className="cards-subtitle">
              Develop your skills and earn rewards by completing real-world tasks<br />
              inside our mobile application.
            </p>
          </div>
        </div>

        {/* Cards Row */}
        <div className="row justify-content-center">
          {/* Learn New Skills Card */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card">
              <img 
                src={newSkillImg} 
                alt="Learn New Skills" 
                className="card-img"
              />
            </div>
          </div>

          {/* Work on Real Tasks Card */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card">
              <img 
                src={workTaskImg} 
                alt="Work on Real Tasks" 
                className="card-img"
              />
            </div>
          </div>

          {/* Earn Rewards Card */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card">
              <img 
                src={earnRewardImg} 
                alt="Earn Rewards" 
                className="card-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cards;