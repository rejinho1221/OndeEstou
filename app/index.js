import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList, 
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const [newMarkerDescription, setNewMarkerDescription] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showTaskList, setShowTaskList] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização é necessária para usar o app');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(currentLocation.coords);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedMarker(coordinate);
    setModalVisible(true);
  };

  const addMarker = () => {
    if (!newMarkerTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o marcador');
      return;
    }

    const newMarker = {
      id: Date.now().toString(),
      coordinate: selectedMarker,
      title: newMarkerTitle,
      description: newMarkerDescription,
      timestamp: new Date().toLocaleString('pt-BR'),
    };

    setMarkers([...markers, newMarker]);
    setNewMarkerTitle('');
    setNewMarkerDescription('');
    setModalVisible(false);
    setSelectedMarker(null);
  };

  const removeMarker = (markerId) => {
    Alert.alert(
      'Remover Marcador',
      'Tem certeza que deseja remover este marcador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            setMarkers(markers.filter(marker => marker.id !== markerId));
          }
        }
      ]
    );
  };

  const centerOnUserLocation = () => {
    if (location) {
      // Esta função seria implementada com uma referência ao MapView
      // Para simplificar, vamos apenas mostrar um alerta
      Alert.alert('Localização', 'Centralizando no seu local...');
    }
  };

  const renderMarker = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskTimestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeMarker(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 Onde Estou?</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={centerOnUserLocation}
          >
            <Ionicons name="locate" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowTaskList(!showTaskList)}
          >
            <Ionicons name="list" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            mapType="standard"
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{marker.title}</Text>
                    <Text style={styles.calloutDescription}>{marker.description}</Text>
                    <Text style={styles.calloutTimestamp}>{marker.timestamp}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="location-outline" size={64} color="#007AFF" />
            <Text style={styles.loadingText}>Obtendo sua localização...</Text>
          </View>
        )}
      </View>

      {/* Task List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTaskList}
        onRequestClose={() => setShowTaskList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskListContainer}>
            <View style={styles.taskListHeader}>
              <Text style={styles.taskListTitle}>Meus Marcadores</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTaskList(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {markers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>Nenhum marcador adicionado</Text>
                <Text style={styles.emptyStateSubtext}>Toque no mapa para adicionar um marcador</Text>
              </View>
            ) : (
              <FlatList
                data={markers}
                renderItem={renderMarker}
                keyExtractor={(item) => item.id}
                style={styles.taskList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Add Marker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addMarkerContainer}>
            <Text style={styles.addMarkerTitle}>Adicionar Marcador</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título do marcador"
              value={newMarkerTitle}
              onChangeText={setNewMarkerTitle}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              value={newMarkerDescription}
              onChangeText={setNewMarkerDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedMarker(null);
                  setNewMarkerTitle('');
                  setNewMarkerDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={addMarker}
              >
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowTaskList(true)}
      >
        <Ionicons name="list" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  taskListContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  taskListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffe6e6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  addMarkerContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addMarkerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutContainer: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutTimestamp: {
    fontSize: 12,
    color: '#999',
  },
}); 