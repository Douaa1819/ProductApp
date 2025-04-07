import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { getProduct, deleteProduct } from '../../../services/product-service';
import { Product } from '../../../types/product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(productId);
      setProduct(data);
    } catch (err) {
      setError('Impossible de charger les détails du produit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    
    try {
      setDeleting(true);
      await deleteProduct(productId);
      setDeleteDialogVisible(false);
      router.replace('/');
    } catch (err) {
      setError('Impossible de supprimer le produit');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Title>Erreur</Title>
        <Paragraph>{error || 'Produit non trouvé'}</Paragraph>
        <Button mode="contained" onPress={() => router.back()}>
          Retour
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={product.name} />
        <Link href={`/product/edit/${productId}` as any} asChild>
  <Appbar.Action icon="pencil" />
</Link>
        <Appbar.Action icon="delete" onPress={() => setDeleteDialogVisible(true)} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {product.imageUrl && (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{product.name}</Title>
            <Title style={styles.price}>{product.price.toFixed(2)} €</Title>
            <Paragraph style={styles.category}>Catégorie: {product.category}</Paragraph>
            <Paragraph style={styles.description}>{product.description}</Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Supprimer le produit</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Êtes-vous sûr de vouloir supprimer ce produit? Cette action est irréversible.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Annuler</Button>
            <Button loading={deleting} onPress={handleDelete}>Supprimer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    color: '#2e7d32',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});