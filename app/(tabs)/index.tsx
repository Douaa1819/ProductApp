// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, Title, Paragraph, Menu, Chip, FAB } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { getProducts, getProductsByCategory } from '../../services/product-service';
import { Product } from '../../types/product';
import ProductItem from '../../components/ProductItem';

export default function ProductListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = ['Électronique', 'Vêtements', 'Livres', 'Maison', 'Tous'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError('Impossible de charger les produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setFilterMenuVisible(false);
    
    try {
      setLoading(true);
      
      if (category === 'Tous') {
        setSelectedCategory(null);
        setFilteredProducts(products);
      } else {
        setSelectedCategory(category);
        const filteredData = await getProductsByCategory(category);
        setFilteredProducts(filteredData);
      }
    } catch (err) {
      setError('Impossible de filtrer les produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Produits" />
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="filter" 
              onPress={() => setFilterMenuVisible(true)} 
            />
          }
        >
          {categories.map((category) => (
            <Menu.Item 
              key={category}
              onPress={() => handleCategoryFilter(category)} 
              title={category} 
            />
          ))}
        </Menu>
      </Appbar.Header>

      {selectedCategory && (
        <Chip 
          style={styles.filterChip}
          onClose={() => handleCategoryFilter('Tous')}
        >
          Catégorie: {selectedCategory}
        </Chip>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Title>Erreur</Title>
          <Paragraph>{error}</Paragraph>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductItem 
            product={item} 
            onPress={() => {
              router.push(`/(tabs)/product/${item.id}` as any);
            }}
          />
          )}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
  style={styles.fab}
  icon="plus"
  onPress={() => {
    router.push("/product/new" as any);
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  filterChip: {
    margin: 8,
  },
});