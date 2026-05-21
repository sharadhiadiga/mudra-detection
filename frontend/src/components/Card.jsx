import { Link } from 'react-router-dom';

export default function Card({ title, description, buttonLabel, to, icon }) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon">{icon}</div>
      <h2 className="feature-card__title">{title}</h2>
      <p className="feature-card__desc">{description}</p>
      <Link to={to} className="feature-card__btn">
        {buttonLabel}
      </Link>
    </article>
  );
}
