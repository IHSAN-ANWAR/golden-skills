import './Cards.css';
import earnRewardImg from '../assets/earn reward.png';
import newSkillImg from '../assets/new skill.png';
import workTaskImg from '../assets/work on real task.png';

const cardData = [
  {
    img: newSkillImg,
    alt: 'Learn New Skills',
    icon: 'fas fa-graduation-cap',
    title: 'Learn New Skills',
    desc: 'Master in-demand digital skills through structured courses and real-world projects.',
  },
  {
    img: workTaskImg,
    alt: 'Work on Real Tasks',
    icon: 'fas fa-tasks',
    title: 'Work on Real Tasks',
    desc: 'Apply what you learn by completing practical tasks assigned by our expert team.',
  },
  {
    img: earnRewardImg,
    alt: 'Earn Rewards',
    icon: 'fas fa-coins',
    title: 'Earn Rewards',
    desc: 'Get paid for every task you complete. The more you do, the more you earn.',
  },
];

const Cards = () => {
  return (
    <section className="cards-section">
      <div className="cards-inner">

        {/* Header */}
        <div className="cards-header">
          <div className="cards-title-row">
            <span className="title-line" />
            <h2 className="cards-title">
              Learn. <span className="gradient-text">Earn.</span> <span className="gradient-text">Excel.</span>
            </h2>
            <span className="title-line" />
          </div>
          <p className="cards-subtitle">
            Develop your skills and earn rewards by completing real-world tasks
            inside our mobile application.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {cardData.map((card, i) => (
            <div className="gs-feature-card" key={i}>

              {/* Image */}
              <div className="gs-card-img-wrapper">
                <img src={card.img} alt={card.alt} className="gs-card-img" />
                <div className="gs-card-img-overlay" />
              </div>

              {/* Body */}
              <div className="gs-card-body">
                <div className="gs-card-icon">
                  <i className={card.icon} />
                </div>
                <h3 className="gs-card-title">{card.title}</h3>
                <p className="gs-card-desc">{card.desc}</p>
              </div>

              {/* Hover accent */}
              <div className="gs-card-accent" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Cards;
