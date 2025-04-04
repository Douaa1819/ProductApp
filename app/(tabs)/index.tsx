import { View, Text,StyleSheet } from 'react-native'
import React from 'react'

const app = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Product App</Text>
    </View>
  )
}

export default app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 42,
    color: 'pink',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})