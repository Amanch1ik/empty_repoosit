import { Link } from 'react-router-dom'
import { useState } from 'react'

const colors = {
  primary: '#021024',
  secondary: '#052659',
  accent: '#5483D3',
  white: '#FFFFFF',
  gray: '#666666',
}

const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    paddingBottom: '100px',
  },
  header: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: colors.white,
    fontSize: '24px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.white,
  },
  filterIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '0 20px 20px',
    overflowX: 'auto',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  },
  activeTab: {
    background: colors.accent,
    color: colors.white,
  },
  inactiveTab: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  newsList: {
    padding: '0 20px',
  },
  newsCard: {
    background: colors.white,
    borderRadius: '20px',
    marginBottom: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  newsImage: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
  },
  newsContent: {
    padding: '20px',
  },
  newsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.primary,
    marginBottom: '8px',
  },
  newsDescription: {
    fontSize: '14px',
    color: colors.gray,
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  newsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: '12px',
    color: colors.gray,
  },
  discountBadge: {
    background: '#E74C3C',
    color: colors.white,
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(2, 16, 36, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '12px 20px 20px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    color: 'rgba(255, 255, 255, 0.5)',
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '12px',
  },
  activeNavItem: {
    color: colors.accent,
    background: 'rgba(84, 131, 211, 0.1)',
  },
  navIcon: {
    fontSize: '22px',
  },
}

export function News() {
  const [activeTab, setActiveTab] = useState('all')

  const news = [
    {
      id: 1,
      title: 'ПИЦЦА СО СКИДКОЙ 40%',
      description: 'Закажите любую пиццу и получите скидку 40% при оплате бонусами YESS',
      date: '7 окт 2025',
      discount: '40%',
      emoji: '🍕',
    },
    {
      id: 2,
      title: 'MEGA SALE НА ВСЁ',
      description: 'Большие скидки на все товары в магазинах-партнерах до конца месяца',
      date: '5 окт 2025',
      discount: '-50%',
      emoji: '🎁',
    },
    {
      id: 3,
      title: 'КОФЕ В ПОДАРОК',
      description: 'При покупке 2 напитков - третий в подарок в сети кофеен',
      date: '3 окт 2025',
      discount: '1+1',
      emoji: '☕',
    },
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/" style={styles.backButton}>←</Link>
        <div style={styles.title}>Новости и акции</div>
        <div style={styles.filterIcon}>⚙</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'all' ? styles.activeTab : styles.inactiveTab)}}
          onClick={() => setActiveTab('all')}
        >
          Все
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'promo' ? styles.activeTab : styles.inactiveTab)}}
          onClick={() => setActiveTab('promo')}
        >
          Акции
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'news' ? styles.activeTab : styles.inactiveTab)}}
          onClick={() => setActiveTab('news')}
        >
          Новости
        </button>
      </div>

      {/* News List */}
      <div style={styles.newsList}>
        {news.map((item) => (
          <div key={item.id} style={styles.newsCard}>
            <div style={styles.newsImage}>{item.emoji}</div>
            <div style={styles.newsContent}>
              <div style={styles.newsTitle}>{item.title}</div>
              <div style={styles.newsDescription}>{item.description}</div>
              <div style={styles.newsFooter}>
                <div style={styles.newsDate}>{item.date}</div>
                <div style={styles.discountBadge}>{item.discount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <Link to="/" style={styles.navItem}>
          <div style={styles.navIcon}>🏠</div>
          <div>Главная</div>
        </Link>
        <Link to="/partners" style={styles.navItem}>
          <div style={styles.navIcon}>❤️</div>
          <div>Партнеры</div>
        </Link>
        <Link to="/news" style={{...styles.navItem, ...styles.activeNavItem}}>
          <div style={styles.navIcon}>🔔</div>
          <div>Новости</div>
        </Link>
        <Link to="/profile" style={styles.navItem}>
          <div style={styles.navIcon}>⚙️</div>
          <div>Профиль</div>
        </Link>
      </div>
    </div>
  )
}
