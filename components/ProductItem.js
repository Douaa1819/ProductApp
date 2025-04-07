// components/ProductItem.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

const ProductItem = ({ product, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Title>{product.name}</Title>
        <Paragraph numberOfLines={2}>{product.description}</Paragraph>
        <Card.Actions style={styles.cardFooter}>
          <Chip mode="outlined">{product.category}</Chip>
          <Title>{product.price.toFixed(2)} €</Title>
        </Card.Actions>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardFooter: {
    justifyContent: 'space-between',
    paddingLeft: 0,
  },
});

export default ProductItem;