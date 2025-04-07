import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, Button, Menu, Divider, Chip, FAB, Searchbar } from 'react-native-paper';
import { getProducts, getProductsByCategory } from '../services/productService';
import ProductItem from '../components/ProductItem';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
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

  const handleCategoryFilter = async (category) => {
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

  const renderItem = ({ item }) => (
    <ProductItem 
      product={item} 
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    />
  );

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
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('ProductForm')}
      />
    </View>
  );
};

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

export default ProductListScreen;