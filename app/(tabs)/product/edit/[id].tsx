import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, HelperText, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { getProduct, updateProduct } from '../../../../services/product-service';
import { Product } from '../../../../types/product';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id;

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await getProduct(productId);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl || '',
          category: product.category,
        });
      }
    } catch (err) {
      showSnackbar('Impossible de charger le produit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Omit<Product, 'id'>, value: string) => {
    let processedValue: string | number = value;
    
    if (field === 'price') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData({
      ...formData,
      [field]: processedValue,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise';
    }
    
    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'L\'URL de l\'image doit être une URL valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !productId) {
      return;
    }
    
    try {
      setSaving(true);
      await updateProduct(productId, formData);
      showSnackbar('Produit mis à jour avec succès');
      router.replace(`/product/${productId}` as any) ;
    } catch (err) {
      showSnackbar('Impossible de mettre à jour le produit');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Modifier le produit" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <TextInput
          label="Nom"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}

        <TextInput
          label="Prix"
          value={formData.price.toString()}
          onChangeText={(value) => handleChange('price', value)}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.price}
        />
        {errors.price && <HelperText type="error">{errors.price}</HelperText>}

        <TextInput
          label="Catégorie"
          value={formData.category}
          onChangeText={(value) => handleChange('category', value)}
          style={styles.input}
          error={!!errors.category}
        />
        {errors.category && <HelperText type="error">{errors.category}</HelperText>}

        <TextInput
          label="URL de l'image (optionnel)"
          value={formData.imageUrl || ''}
          onChangeText={(value) => handleChange('imageUrl', value)}
          style={styles.input}
          error={!!errors.imageUrl}
        />
        {errors.imageUrl && <HelperText type="error">{errors.imageUrl}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Mettre à jour le produit
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});