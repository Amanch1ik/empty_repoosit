import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Home,
  Heart,
  Bell,
  User,
  Search,
  Scan,
  ShoppingBag,
  Shirt,
  Laptop,
  Coffee,
  Baby,
  Dumbbell,
  Car,
  GraduationCap,
  Sparkles,
  Sofa,
  Apple
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';

// Цвета из дизайна YESS
const colors = {
  primary: '#004D40',
  primaryLight: '#00695C',
  gold: '#FFB300',
  goldLight: '#FFD54F',
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#F5F5F5',
  background: '#FAFAFA',
  text: '#212121',
};

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  padding-bottom: 80px;
`;

const Header = styled.header`
  background: ${colors.primary};
  padding: 16px 20px 24px;
  border-radius: 0 0 24px 24px;
  color: ${colors.white};
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const UserPhone = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;

const HeaderIcons = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const BalanceCard = styled(Link)`
  background: ${colors.white};
  border-radius: 16px;
  padding: 20px;
  margin: 0 20px 20px;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const BalanceInfo = styled.div`
  flex: 1;
`;

const BalanceLabel = styled.div`
  font-size: 13px;
  color: ${colors.gray};
  margin-bottom: 4px;
`;

const BalanceAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.text};
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const CoinName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.gold};
`;

const HistoryLink = styled.span`
  font-size: 14px;
  color: ${colors.gray};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CoinIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 179, 0, 0.3);
  font-size: 28px;
  font-weight: 700;
  color: ${colors.white};
`;

const PartnerCards = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PartnerCard = styled.div<{ color?: string }>`
  min-width: 160px;
  height: 100px;
  border-radius: 16px;
  background: ${props => props.color || colors.primary};
  padding: 16px;
  color: ${colors.white};
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.02);
  }
`;

const Discount = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const PartnerName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const PartnerLogo = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
`;

const Section = styled.div`
  padding: 0 20px 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
`;

const ViewAll = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const CategoryItem = styled.button`
  background: ${colors.white};
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const CategoryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
`;

const CategoryName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.text};
  text-align: center;
`;

const PartnersRow = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PartnerLogo2 = styled.div`
  min-width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${colors.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.white};
  padding: 12px 20px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => props.$active ? colors.primary : colors.gray};
  text-decoration: none;
  font-size: 11px;
  font-weight: 500;
  padding: 8px 12px;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const QRButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
  border: none;
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 77, 64, 0.3);
  margin-top: -28px;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

interface UserData {
  username: string;
  phone: string;
  total_bonus_points: number;
}

export function ImprovedDashboard() {
  const [activeTab] = useState('home');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Демо данные
    setUserData({
      username: 'Тынаев Сырғақ',
      phone: '+996 507700007',
      total_bonus_points: 55.7
    });
  }, []);

  const categories = [
    { id: 1, name: 'Одежда и обувь', icon: Shirt },
    { id: 2, name: 'Все для дома', icon: Sofa },
    { id: 3, name: 'Электроника', icon: Laptop },
    { id: 4, name: 'Еда и напитки', icon: Apple },
    { id: 5, name: 'Красота', icon: Sparkles },
    { id: 6, name: 'Продукты', icon: ShoppingBag },
    { id: 7, name: 'Детское', icon: Baby },
    { id: 8, name: 'Спорт и отдых', icon: Dumbbell },
    { id: 9, name: 'Кафе', icon: Coffee },
  ];

  return (
    <Container>
      {/* Header */}
      <Header>
        <ProfileSection>
          <Avatar>
            <User size={24} />
          </Avatar>
          <UserInfo>
            <UserName>{userData?.username || 'Загрузка...'}</UserName>
            <UserPhone>{userData?.phone || '+996 ...'}</UserPhone>
          </UserInfo>
          <HeaderIcons>
            <IconButton>
              <Search size={20} />
            </IconButton>
            <IconButton>
              <Bell size={20} />
            </IconButton>
          </HeaderIcons>
        </ProfileSection>

        {/* Balance Card */}
        <BalanceCard to="/balance">
          <BalanceInfo>
            <BalanceLabel>Ваш Баланс</BalanceLabel>
            <BalanceAmount>
              {userData?.total_bonus_points?.toFixed(1) || '0.0'}
              <CoinName>Yess!Coin</CoinName>
            </BalanceAmount>
            <HistoryLink>История →</HistoryLink>
          </BalanceInfo>
          <CoinIcon>₸</CoinIcon>
        </BalanceCard>
      </Header>

      {/* Partner Discount Cards */}
      <PartnerCards>
        <PartnerCard color="#E53935">
          <Discount>-20%</Discount>
          <PartnerName>Небай</PartnerName>
          <PartnerLogo />
        </PartnerCard>
        <PartnerCard color="#00897B">
          <Discount>-15%</Discount>
          <PartnerName>Antalya</PartnerName>
          <PartnerLogo />
        </PartnerCard>
        <PartnerCard color="#1E88E5">
          <Discount>-25%</Discount>
          <PartnerName>Магнум</PartnerName>
          <PartnerLogo />
        </PartnerCard>
      </PartnerCards>

      {/* Categories */}
      <Section>
        <CategoryGrid>
          {categories.map(category => (
            <CategoryItem key={category.id}>
              <CategoryIcon>
                <category.icon size={24} />
              </CategoryIcon>
              <CategoryName>{category.name}</CategoryName>
            </CategoryItem>
          ))}
        </CategoryGrid>
      </Section>

      {/* Partners Logos */}
      <Section>
        <SectionHeader>
          <SectionTitle>Наши Партнеры</SectionTitle>
          <ViewAll>Смотреть Все</ViewAll>
        </SectionHeader>
        <PartnersRow>
          <PartnerLogo2>🌿</PartnerLogo2>
          <PartnerLogo2>🛒</PartnerLogo2>
          <PartnerLogo2>🍕</PartnerLogo2>
          <PartnerLogo2>🏪</PartnerLogo2>
          <PartnerLogo2>🎮</PartnerLogo2>
        </PartnersRow>
      </Section>

      {/* Bottom Navigation */}
      <BottomNav>
        <NavItem to="/" $active={activeTab === 'home'}>
          <Home size={24} />
          <div>Главная</div>
        </NavItem>
        <NavItem to="/partners">
          <Heart size={24} />
          <div>Партнеры</div>
        </NavItem>
        <QRButton>
          <Scan size={28} />
        </QRButton>
        <NavItem to="/notifications">
          <Bell size={24} />
          <div>Уведомления</div>
        </NavItem>
        <NavItem to="/profile">
          <User size={24} />
          <div>Еще</div>
        </NavItem>
      </BottomNav>
    </Container>
  );
}

