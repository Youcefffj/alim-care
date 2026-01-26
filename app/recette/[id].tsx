import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Heart, Clock, Users, Lightbulb } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import recipes from '../../data/recipes.json';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isFavorite, setIsFavorite] = useState(false);

  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Recette non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Image Header */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.headerImage} />
        <View style={styles.imageOverlay} />
        
        {/* Header Buttons */}
        <SafeAreaView style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recipe.title}</Text>
            <TouchableOpacity 
              style={styles.favoriteBtn}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart 
                color={isFavorite ? Colors.primary : Colors.grayMedium} 
                size={22} 
                fill={isFavorite ? Colors.primary : "transparent"}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock color={Colors.grayMedium} size={16} />
              <Text style={styles.metaText}>{recipe.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users color={Colors.grayMedium} size={16} />
              <Text style={styles.metaText}>{recipe.servings || 4} pers.</Text>
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Nutritional Info */}
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Image source={require('../../assets/Icon_glucides.png')} style={styles.nutritionIcon} />
              <Text style={styles.nutritionText}>{recipe.carbs} glucides</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Image source={require('../../assets/Icon_avocat.png')} style={styles.nutritionIcon} />
              <Text style={styles.nutritionText}>{recipe.proteins} protéines</Text>
            </View>
          </View>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Image source={require('../../assets/Icon_Kcal.png')} style={styles.nutritionIcon} />
              <Text style={styles.nutritionText}>{recipe.calories} Kcal</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Image source={require('../../assets/Icon_gras.png')} style={styles.nutritionIcon} />
              <Text style={styles.nutritionText}>{recipe.fat} gras</Text>
            </View>
          </View>
        </View>



        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
              Ingrédients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
            onPress={() => setActiveTab('instructions')}
          >
            <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
              Instructions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'ingredients' ? (
            <View>
              <Text style={styles.portionsText}>Portions: {recipe.servings || 4}</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View>
              {recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.stepNumber}>{instruction.step}.</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>{instruction.title}</Text>
                      <Text style={styles.instructionText}>{instruction.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noContent}>Instructions à venir...</Text>
              )}
            </View>
          )}
        </View>

        {/* Complete Button */}
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>Recette terminée</Text>
        </TouchableOpacity>

        {/* Tips Section */}
        {recipe.tips && recipe.tips.length > 0 && (
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <Lightbulb color={Colors.secondary} size={20} />
              <Text style={styles.tipsTitle}>Astuces</Text>
            </View>
            {recipe.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -30,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titleSection: {
    padding: 20,
    paddingTop: 25,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EBF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    flex: 1,
    marginRight: 10,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: Colors.grayMedium,
  },
  description: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
    marginTop: 15,
  },
  seeMore: {
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 20,
  },
  nutritionGrid: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  nutritionItem: {
    width: (width - 50) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  nutritionIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  nutritionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.contrastMainII,
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.gris,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  activeTabText: {
    color: '#FFF',
  },
  tabContent: {
    padding: 20,
  },
  portionsText: {
    fontSize: 14,
    color: Colors.grayMedium,
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.contrastMainII,
    flex: 1,
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 10,
    width: 25,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.contrastMainII,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
  },
  noContent: {
    fontSize: 14,
    color: Colors.grayMedium,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.contrastMainII,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: Colors.secondary,
    marginRight: 8,
    fontSize: 14,
  },
  tipText: {
    fontSize: 13,
    color: Colors.grayDark,
    flex: 1,
    lineHeight: 20,
  },
});
