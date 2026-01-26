import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, SlidersHorizontal, Clock, Heart, X, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import recipes from '../../data/recipes.json';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type TabType = 'recettes' | 'favoris' | 'historique';

interface Filters {
  duration: string | null;
  mealType: string[];
  cuisineStyle: string[];
  diet: string[];
}

const FILTER_OPTIONS = {
  duration: ['~ 15 min', '~ 30 min', '> 30 min'],
  mealType: ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'Snacks'],
  cuisineStyle: ['Française', 'Méditerranéenne', 'Orientale', 'Asiatique'],
  diet: ['Végétarien', 'Sans gluten', 'Produits laitiers', 'Végan'],
};

export default function RecettesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('recettes');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    duration: null,
    mealType: [],
    cuisineStyle: [],
    diet: [],
  });
  const [tempFilters, setTempFilters] = useState<Filters>({
    duration: null,
    mealType: [],
    cuisineStyle: [],
    diet: [],
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const openFilters = () => {
    setTempFilters({ ...filters });
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = { duration: null, mealType: [], cuisineStyle: [], diet: [] };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const toggleDuration = (value: string) => {
    setTempFilters(prev => ({
      ...prev,
      duration: prev.duration === value ? null : value,
    }));
  };

  const toggleArrayFilter = (category: 'mealType' | 'cuisineStyle' | 'diet', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  const removeFilter = (value: string) => {
    if (filters.duration === value) {
      setFilters(prev => ({ ...prev, duration: null }));
    } else if (filters.mealType.includes(value)) {
      setFilters(prev => ({ ...prev, mealType: prev.mealType.filter(v => v !== value) }));
    } else if (filters.cuisineStyle.includes(value)) {
      setFilters(prev => ({ ...prev, cuisineStyle: prev.cuisineStyle.filter(v => v !== value) }));
    } else if (filters.diet.includes(value)) {
      setFilters(prev => ({ ...prev, diet: prev.diet.filter(v => v !== value) }));
    }
  };

  const activeFilters = [
    filters.duration,
    ...filters.mealType,
    ...filters.cuisineStyle,
    ...filters.diet,
  ].filter(Boolean) as string[];

  const hasActiveFilters = activeFilters.length > 0;
  const hasTempFilters = tempFilters.duration || tempFilters.mealType.length || tempFilters.cuisineStyle.length || tempFilters.diet.length;

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedRecipes = activeTab === 'favoris' 
    ? recipes.filter(r => favorites.includes(r.id))
    : activeTab === 'historique'
    ? []
    : filteredRecipes;

  const renderRecipeCard = ({ item }: { item: typeof recipes[0] }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => router.push(`/recette/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <TouchableOpacity 
          style={[
            styles.favoriteBtn,
            favorites.includes(item.id) && styles.favoriteBtnActive
          ]}
          onPress={() => toggleFavorite(item.id)}
        >
          <Heart 
            size={18} 
            color={favorites.includes(item.id) ? '#FFF' : Colors.grayMedium}
            fill={favorites.includes(item.id) ? '#FFF' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.recipeCarbs}>Glucides ~{item.carbs.replace('g', '')}g</Text>
        <View style={styles.recipeTime}>
          <Clock size={12} color={Colors.grayMedium} />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'recettes', label: 'Recettes' },
    { key: 'favoris', label: 'Favoris' },
    { key: 'historique', label: 'Historique' },
  ];

  const renderFilterChip = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={label}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.headerTitle}>Catalogue de recettes</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.grayMedium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nom de plat ou d'un ingrédient"
              placeholderTextColor={Colors.grayMedium}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            onPress={openFilters}
          >
            <SlidersHorizontal size={20} color={hasActiveFilters ? '#FFF' : Colors.contrastMainII} />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {hasActiveFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersContainer}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {activeFilters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={styles.activeFilterChip}
                onPress={() => removeFilter(filter)}
              >
                <Text style={styles.activeFilterText}>{filter}</Text>
                <X size={14} color="#FFF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recipe Grid */}
        {displayedRecipes.length > 0 ? (
          <FlatList
            data={displayedRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Heart size={48} color={Colors.grayMedium} />
            <Text style={styles.emptyText}>
              {activeTab === 'favoris' 
                ? 'Aucune recette en favoris'
                : activeTab === 'historique'
                ? 'Historique vide'
                : 'Aucune recette trouvée'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'favoris'
                ? 'Ajoutez des recettes à vos favoris pour les retrouver ici'
                : activeTab === 'historique'
                ? 'Les recettes consultées apparaîtront ici'
                : 'Essayez avec d\'autres mots-clés'}
            </Text>
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <ArrowLeft size={24} color={Colors.contrastMainII} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filtres</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Duration */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Durée de préparation :</Text>
                <View style={styles.filterChipsRow}>
                  {FILTER_OPTIONS.duration.map(option => 
                    renderFilterChip(
                      option,
                      tempFilters.duration === option,
                      () => toggleDuration(option)
                    )
                  )}
                </View>
              </View>

              {/* Meal Type */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Type de repas :</Text>
                <View style={styles.filterChipsWrap}>
                  {FILTER_OPTIONS.mealType.map(option => 
                    renderFilterChip(
                      option,
                      tempFilters.mealType.includes(option),
                      () => toggleArrayFilter('mealType', option)
                    )
                  )}
                </View>
              </View>

              {/* Cuisine Style */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Style de cuisine :</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeMoreText}>Voir plus</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.filterChipsWrap}>
                  {FILTER_OPTIONS.cuisineStyle.map(option => 
                    renderFilterChip(
                      option,
                      tempFilters.cuisineStyle.includes(option),
                      () => toggleArrayFilter('cuisineStyle', option)
                    )
                  )}
                </View>
              </View>

              {/* Diet */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Régime alimentaire :</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeMoreText}>Voir plus</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.filterChipsWrap}>
                  {FILTER_OPTIONS.diet.map(option => 
                    renderFilterChip(
                      option,
                      tempFilters.diet.includes(option),
                      () => toggleArrayFilter('diet', option)
                    )
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            {hasTempFilters && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: Colors.white,
  },
  container: { 
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    textAlign: 'center',
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.contrastMainII,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activeFiltersContainer: {
    maxHeight: 44,
    marginBottom: 12,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.grayMedium,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteBtnActive: {
    backgroundColor: Colors.primary,
  },
  cardContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.contrastMainII,
    marginBottom: 4,
    lineHeight: 18,
  },
  recipeCarbs: {
    fontSize: 12,
    color: Colors.grayMedium,
    marginBottom: 6,
  },
  recipeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.grayMedium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.contrastMainII,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.grayMedium,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.contrastMainII,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.contrastMainII,
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: Colors.white,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.contrastMainII,
  },
  filterChipTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
