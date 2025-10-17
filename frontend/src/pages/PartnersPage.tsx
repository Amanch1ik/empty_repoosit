import { useState } from 'react';
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
  Apple,
  Grid3x3,
  Scissors
} from 'lucide-react';

const colors = {
  primary: '#004D40',
  primaryLight: '#00695C',
  gold: '#FFB300',
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#F5F5F5',
  background: '#FAFAFA',
  text: '#212121',
};

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  padding: 16px 16px 80px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 14px 16px 14px 44px;
  border-radius: 16px;
  border: none;
  background: ${colors.white};
  font-size: 15px;
  color: ${colors.text};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &::placeholder {
    color: ${colors.gray};
  }

  &:focus {
    outline: 2px solid ${colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 32px;
  color: ${colors.gray};
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const FilterButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: ${colors.white};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    background: ${colors.lightGray};
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 16px 0;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const CategoryCard = styled.button`
  background: ${colors.white};
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const CategoryIconWrapper = styled.div<{ color?: string }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.color || colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
`;

const CategoryName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.text};
  text-align: center;
  line-height: 1.3;
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

export function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab] = useState('partners');

  const categories = [
    { id: 1, name: 'Все компании', icon: Grid3x3, color: '#5C6BC0' },
    { id: 2, name: 'Еда и напитки', icon: Apple, color: '#FF7043' },
    { id: 3, name: 'Одежда и обувь', icon: Shirt, color: '#42A5F5' },
    { id: 4, name: 'Красота', icon: Scissors, color: '#EC407A' },
    { id: 5, name: 'Все для дома', icon: Sofa, color: '#66BB6A' },
    { id: 6, name: 'Продукты', icon: ShoppingBag, color: '#FFA726' },
    { id: 7, name: 'Электроника', icon: Laptop, color: '#26C6DA' },
    { id: 8, name: 'Детское', icon: Baby, color: '#FFCA28' },
    { id: 9, name: 'Спорт и отдых', icon: Dumbbell, color: '#AB47BC' },
    { id: 10, name: 'Кафе и рестораны', icon: Coffee, color: '#8D6E63' },
    { id: 11, name: 'Транспорт', icon: Car, color: '#78909C' },
    { id: 12, name: 'Образование', icon: GraduationCap, color: '#7E57C2' },
  ];

  return (
    <Container>
      {/* Search Bar */}
      <SearchBar>
        <SearchWrapper>
          <SearchIcon size={20} />
          <SearchInput
            type="text"
            placeholder="Поиск по компаниям"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
        <FilterButton>
          <Sparkles size={20} />
        </FilterButton>
      </SearchBar>

      {/* Categories Title */}
      <SectionTitle>Категории</SectionTitle>

      {/* Categories Grid */}
      <CategoryGrid>
        {categories.map(category => (
          <CategoryCard key={category.id}>
            <CategoryIconWrapper color={category.color}>
              <category.icon size={28} />
            </CategoryIconWrapper>
            <CategoryName>{category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoryGrid>

      {/* Bottom Navigation */}
      <BottomNav>
        <NavItem to="/">
          <Home size={24} />
          <div>Главная</div>
        </NavItem>
        <NavItem to="/partners" $active={activeTab === 'partners'}>
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

