import React, {useState, useEffect, useCallback, useRef} from 'react';
import { View,Modal,Button,TouchableOpacity,Text,StyleSheet,FlatList,Image, Dimensions,Animated,useWindowDimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {addImage, saveImagesToStorage} from '../redux/imageSlice';
import Toast from 'react-native-toast-message';
import {Share} from 'react-native';
import ImageCropPicker, { Image as CropperImage } from 'react-native-image-crop-picker';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
 
 
const MIN_ZOOM_LEVEL = 1;   
const MAX_ZOOM_LEVEL = 4;   
const ZOOMED_OUT_COLUMNS = 4;
const DEFAULT_COLUMNS = 3;
const MIN_COLUMNS = 1;


const FloatingActionButton: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);2
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  // const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [columnCount, setColumnCount] = useState<number>(2);
  const [pendingColumnCount, setPendingColumnCount] = useState<number>(2);
  const dispatch = useDispatch();
  const images = useSelector((state: any) => state.images.byDate);
  const [columnSelectModalVisible, setColumnSelectModalVisible] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string[] }>({});
  // const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<string | null>(null);
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [numColumns, setNumColumns] = useState(DEFAULT_COLUMNS);
  const flatListRef = useRef<FlatList<any>>(null); 
  const { width } = Dimensions.get('window');

 
  interface ImageData {
    id: string;
    uri: string;
    type: string;
  }
 
 
  interface MediaItem {
    uri: string | undefined;
    type: string;
    id: string;
    date: string;
    images: ImageData[];
  }
 
  useEffect(() => {
    setSelectionMode(null);
    setShowFooter(false);
  }, []);
 
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };
 
  // const handleLogout = () => {
  //   dispatch(logout());
  // };
 
  const handleCancel = () => {
    setSelectedImages({});
    setSelectionMode(null);
    setShowFooter(false);
  };
 
  const handleSave = () => {
    if (Object.keys(selectedImages).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Images Selected',
        text2: 'Please select some images before saving.',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Image Saved Successfully',
    });
    setSelectedImages({});

  };
 
  const handleSaveImage = () => {
    Toast.show({
      type: 'success',
      text1: 'Image Saved Successfully',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
  };
 
  // const handleSaveVideo = () => {
  //   Toast.show({
  //     type: 'success',
  //     position: 'bottom',
  //     text1: 'Video Saved',
  //     text2: 'Your video has been saved successfully!',
  //     visibilityTime: 3000,
  //     autoHide: true,
  //     bottomOffset: 40,
  //   });
  // };
 
  const handleShare = async () => {
    if (Object.keys(selectedImages).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Images Selected',
        text2: 'Please select some images before sharing.',
      });
      return;
    }
    try {
      const result = await Share.share({
        message: 'Check out this awesome content!',
        title: 'Share',
      });
 
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type of:', result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setSelectedImages({});

  };
 
  const handlePickImage = () => {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
    })
      .then(asset => {
        if (asset.path) {
          const selectedDate = new Date().toLocaleDateString();
          dispatch(addImage({ uri: asset.path, date: selectedDate }));
          saveImagesToStorage({
            ...images,
            [selectedDate]: [...(images[selectedDate] || []), asset.path],
          });
          setImagePreview(asset.path);
        }
      })
      .catch(error => {
        console.error('Error picking image:', error);
      });
    setModalVisible(false);
  };
 
  const handlePickVideo = () => {
    ImageCropPicker.openPicker({
      mediaType: 'video',
    })
      .then(asset => {
        if (asset.path) {
          const selectedDate = new Date().toLocaleDateString();
          dispatch(addImage({ uri: asset.path, date: selectedDate }));
          saveImagesToStorage({
            ...images,
            [selectedDate]: [...(images[selectedDate] || []), asset.path],
          });
          setVideoPreview(asset.path);
        }
      })
      .catch(error => {
        console.error('Error picking video:', error);
      });
    setModalVisible(false);
  };
 
  const handleCamera = () => {
    ImageCropPicker.openCamera({
      mediaType: 'photo',
      cropping: true,
    })
      .then(asset => {
        if (asset.path) {
          const selectedDate = new Date().toLocaleDateString();
          dispatch(addImage({ uri: asset.path, date: selectedDate }));
          saveImagesToStorage({
            ...images,
            [selectedDate]: [...(images[selectedDate] || []), asset.path],
          });
          setImagePreview(asset.path);
        }
      })
      .catch(error => {
        console.error('Error taking photo:', error);
      });
    setModalVisible(false);
  };
 
  const handleRecordVideo = () => {
    ImageCropPicker.openCamera({
      mediaType: 'video',
    })
      .then(asset => {
        if (asset.path) {
          const selectedDate = new Date().toLocaleDateString();
          dispatch(addImage({ uri: asset.path, date: selectedDate }));
          saveImagesToStorage({
            ...images,
            [selectedDate]: [...(images[selectedDate] || []), asset.path],
          });
          setVideoPreview(asset.path);
        }
      })
      .catch(error => {
        console.error('Error recording video:', error);
      });
    setModalVisible(false);
  };
 
  const screenWidth = Dimensions.get('window').width;
  const itemPadding = 1;
 
  const renderItem = ({ item }: { item: { uri: string } }) => {
    const isSelected = selectionMode && selectedImages[selectionMode]?.includes(item.uri);
    const isVideo = item.uri.endsWith('.mp4');
    const itemSize = calculateImageWidth(); 
  
    return (
      <TouchableOpacity
        onPress={() => {
          if (selectionMode) {
            // Toggle selection
            setSelectedImages(prevSelected => {
              const selectedForDate = prevSelected[selectionMode] || [];
              if (selectedForDate.includes(item.uri)) {
                return {
                  ...prevSelected,
                  [selectionMode]: selectedForDate.filter(uri => uri !== item.uri),
                };
              } else {
                return {
                  ...prevSelected,
                  [selectionMode]: [...selectedForDate, item.uri],
                };
              }
            });
          } else {
            // Handle normal item press
            if (isVideo) {
              setVideoPreview(item.uri);
            } else {
              setImagePreview(item.uri);
            }
          }
        }}
        style={{
          flex: 1 / numColumns,
          margin: itemPadding, 
          height: itemSize, 
        }}>
        {isVideo ? (
          <View style={styles.media}>
            <Video
              source={{ uri: item.uri }}
              style={{
                width: '100%', 
                height: itemSize, 
              }}
              resizeMode="cover"
              paused={true}
            />
            <Icon
              name="play-circle"
              size={50}
              color="#fff"
              style={styles.playIcon}
            />
          </View>
        ) : (
          <View style={styles.media}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: '100%', 
                height: itemSize, 
              }}
              resizeMode="cover" 
            />
          </View>
        )}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.selectionCircle}>
              <Text style={styles.selectionText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  const renderDateHeader = ({ item }: { item: { date: string } }) => {
    const isFirstDate = item.date === getImagesByDate()[0]?.date;
  
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.displayDate}>{item.date}</Text>
        {!showFooter && isFirstDate && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => handleButtonOne(item.date)}
            >
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
          </View>
        )}
      </View>
    );
  };
  
  const handleButtonOne = (date: string) => {
    console.log('Button 1 clicked for date:', date);
    if (selectionMode === date) {
      setSelectionMode(null);
      setShowFooter(false);
    } else {
      setSelectionMode(date);
      setShowFooter(true);
    }
  };
 
  // const handleIconPress = (date: string) => {
  //   setColumnSelectModalVisible(true);
  // };
 
 
const getImagesByDate = () => {
  const todayDate = new Date();
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);

  const todayDateString = todayDate.toLocaleDateString();
  const yesterdayDateString = yesterdayDate.toLocaleDateString();

  // Sort dates and order them from the most recent to the earliest
  const sortedDates = Object.keys(images).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);

    const dateA = new Date(yearA ?? 0, (monthA ?? 1) - 1, dayA ?? 1);
    const dateB = new Date(yearB ?? 0, (monthB ?? 1) - 1, dayB ?? 1);

    return dateB.getTime() - dateA.getTime();
  });

  const imageGroups = sortedDates.map((date) => {
    if (images[date] && images[date].length > 0) {
      let displayDate = date;

      if (date === todayDateString) {
        displayDate = 'Today';
      } else if (date === yesterdayDateString) {
        displayDate = 'Yesterday';
      }

      return {
        date: displayDate,
        data: images[date].map((uri: string) => ({ uri, date: displayDate })),
      };
    }
    return null;
  });

  // Filter out null entries
  const filteredGroups = imageGroups.filter(
    (group) => group !== null
  ) as Array<{ date: string; data: { uri: string; date: string }[] }>;

  // Custom sorting to ensure Today, Yesterday, and other dates appear correctly
  return filteredGroups.sort((a, b) => {
    if (a.date === 'Today') return -1;
    if (b.date === 'Today') return 1;
    if (a.date === 'Yesterday') return -1;
    if (b.date === 'Yesterday') return 1;

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
};

 
// const handleCropImage = () => {
//   if (imagePreview) {
//       ImageCropPicker.openCropper({
//           path: imagePreview,
//           cropping: true,
//           mediaType: 'photo'
//       })
//       .then((asset: CropperImage) => {
//           if (asset?.path) {
//               const selectedDate = new Date().toLocaleDateString();
//               dispatch(addImage({ uri: asset.path, date: selectedDate }));
//               saveImagesToStorage({
//                   ...images,
//                   [selectedDate]: [...(images[selectedDate] || []), asset.path],
//               });
//               setImagePreview(asset.path);
//           }
//       })
//       .catch(error => {
//           console.error('Error cropping image:', error);
//           setImagePreview(imagePreview);
//       });
//   }
// };
//   const handleButton1Click = (date: string) => {
//     setSelectedDate(date === selectedDate ? null : date);
//   };
 
  const handleImageSelect = (date: string, imageId: string, images: MediaItem[]) => {
    setSelectedImages(prevSelected => {
      const selectedForDate = prevSelected[date] || [];
      const isSelected = selectedForDate.includes(imageId);
      const selectedItem = images.find(image => image.id === imageId);
      const isVideo = selectedItem?.type === 'video';
 
     
 
      if (isSelected) {
        const updatedSelection = {
          ...prevSelected,
          [date]: selectedForDate.filter(id => id !== imageId),
        };
        return updatedSelection;
      } else {
        if (isVideo) {
          const newSelected = selectedForDate.filter(id => {
            const item = images.find(img => img.id === id);
            return !(item && item.type === 'video');
          });
          const updatedSelection = {
            ...prevSelected,
            [date]: [...newSelected, imageId],
          };
          console.log('Video Select Updated Selection:', updatedSelection);
          return updatedSelection;
        } else {
          const updatedSelection = {
            ...prevSelected,
            [date]: [...selectedForDate, imageId],
          };
          return updatedSelection;
        }
      }
    });
};
const handlePinch = Animated.event(
  [{ nativeEvent: { scale: new Animated.Value(1) } }],
  {
    useNativeDriver: false,
    listener: (event: PinchGestureHandlerGestureEvent) => {
      const { scale } = event.nativeEvent;
      console.log(`Pinch Scale: ${scale}`); 
    },
  }
);


const onPinchStateChange = (event: { nativeEvent: any; }) => {
  const { nativeEvent } = event;

  if (nativeEvent.state === 5) {
    const newZoomLevel = Math.max(MIN_ZOOM_LEVEL, Math.min(nativeEvent.scale, MAX_ZOOM_LEVEL));
    setZoomLevel(newZoomLevel);
    console.log('Pinch Gesture Started');

    if (newZoomLevel >= 3.5) {
      setNumColumns(ZOOMED_OUT_COLUMNS);
    } else if (newZoomLevel >= 2.5) {
      setNumColumns(DEFAULT_COLUMNS);
    } else if (newZoomLevel >= 1.5) {
      setNumColumns(2);
    } else {
      setNumColumns(MIN_COLUMNS);
    }
  }
};

useEffect(() => {
  if (flatListRef.current) {
    flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
  }
}, [numColumns]);

const calculateImageWidth = () => {
  return width / numColumns; 
};

return (
  <View style={styles.container}>

    <View style={styles.mediaHeaderContainer}>
      <Text style={styles.mediaHeading}>Photo Album</Text>
    </View>
    

    {selectionMode && (
      <View style={styles.selectionHeaderContainer}>
        <View style={styles.selectionHeaderContent}>
          <Text style={styles.selectionHeaderText}>
            {selectedImages[selectionMode]?.length || 0} selected
          </Text>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}

<FlatList
  ref={flatListRef}
  data={getImagesByDate()}
  ListEmptyComponent={() => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image 
  source={require('../assets/NoImage.jpg')} 
  style={{ width: 800, height: 800 }} 
      />
      
    </View>
  )}
  renderItem={({ item }) => (
    <>
      {renderDateHeader({ item })}
      <PinchGestureHandler
        onGestureEvent={handlePinch}
        onHandlerStateChange={onPinchStateChange}
      >
        <Animated.View style={{ flex: 1 }}>
          <FlatList
            data={item.data}
            renderItem={renderItem}
            keyExtractor={item => item.uri}
            numColumns={numColumns}
            key={`${item.date}-${numColumns}`}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </PinchGestureHandler>
    </>
  )}
  keyExtractor={item => item.date}
  style={{ flex: 1 }}
/>

 {showFooter && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleSave}>
            <Text style={styles.footerButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.shareButton]}
            onPress={handleShare}>
            <Text style={styles.footerButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
 
      {!selectionMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
 
      {/* Column Selection Modal */}
      <Modal
        visible={columnSelectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setColumnSelectModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Column</Text>
            <View style={styles.columnAdjust}>
              <TouchableOpacity
                style={styles.columnButton}
                onPress={() =>
                  setPendingColumnCount(Math.max(1, pendingColumnCount - 1))
                }>
                <Text style={styles.columnButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.columnCount}>{pendingColumnCount}</Text>
              <TouchableOpacity
                style={styles.columnButton}
                onPress={() => setPendingColumnCount(pendingColumnCount + 1)}>
                <Text style={styles.columnButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setColumnCount(pendingColumnCount);
                  setColumnSelectModalVisible(false);
                }}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setColumnSelectModalVisible(false)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
 
      {/* Modal for Image/Video Picking */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handlePickImage}>
            <Text style={styles.modalButtonText}>Pick Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handlePickVideo}>
            <Text style={styles.modalButtonText}>Pick Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={handleCamera}>
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleRecordVideo}>
            <Text style={styles.modalButtonText}>Record Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
 
   
     
      <Modal transparent={true} visible={!!imagePreview} animationType="slide">
  <View style={styles.modalContainer}>
    {/* Conditionally render header or toast */}
    <View style={styles.modalHeader}>
      {toastMessage ? (
        <Text style={styles.toastText}>{toastMessage}</Text>
      ) : (
        <Text style={styles.headingText}>Item Preview</Text>
      )}
    </View>
 
    <View style={styles.ppreviewModalContent}>
      {imagePreview ? (
        <Image source={{ uri: imagePreview }} style={styles.fullImage} />
      ) : (
        <Text>No Image Available</Text>
      )}
      <Button title="Close" onPress={() => setImagePreview(null)} />
    </View>
 
    <View style={styles.modalFooter}>
      <TouchableOpacity
        onPress={() => {
          handleSaveImage();
          showToast('Image Saved');
        }}>
        <Text style={styles.buttonTextModal}>Save</Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        onPress={() => {
          handleShare();
          showToast('Shared Successfully');
        }}>
        <Text style={styles.buttonTextModal}>Share</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
 
      {/* Video Preview Modal */}
      <Modal transparent={true} visible={!!videoPreview} animationType="slide">
  <View style={styles.modalContainer}>
  <View style={styles.modalHeader}>
      {toastMessage ? (
        <Text style={styles.toastText}>{toastMessage}</Text>
      ) : (
        <Text style={styles.headingText}>Item Preview</Text>
      )}
    </View>
    <View style={styles.ppreviewModalContent}>
      {videoPreview ? (
        <Video
          source={{ uri: videoPreview }}
          style={styles.fullImage}
          controls={true}
          resizeMode="contain"
        />
      ) : (
        <Text>No Video Available</Text>
      )}
      <Button title="Close" onPress={() => setVideoPreview(null)} />
    </View>
    <View style={styles.modalFooter}>
      <TouchableOpacity
        onPress={() => {
          handleSaveImage();
          showToast('Image Saved');
        }}>
        <Text style={styles.buttonTextModal}>Save</Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        onPress={() => {
          handleShare();
          showToast('Shared Successfully');
        }}>
        <Text style={styles.buttonTextModal}>Share</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  boxContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  mediaHeaderContainer: {
    alignSelf: 'stretch', 
    marginHorizontal: -20, 
    backgroundColor: 'white', 
    borderBottomWidth: 10,
    borderBottomColor: 'lightblue',
    paddingVertical: 10,
    marginTop: 15, 
  },
  mediaHeading: {
    color: 'blue',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 25, 
    marginBottom: 10, 

  },
  dateContainer: {
    marginTop: 15,
    marginBottom: 5,
    paddingLeft: 10,
  },
  displayDate: {
    color: 'grey',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {
    flex: 1,
  },
  media: {
    flex: 1,
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -25}, {translateY: -25}],
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200EE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '45%',
    alignItems: 'center',
  },
 
  closeButton: {
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalHeading: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  settingsContainer: {
    alignItems: 'center',
  },
  modalOption: {
    color: 'black',
    fontSize: 18,
    marginBottom: 10,
  },
  columnAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  columnButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
  },
  columnButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  columnCount: {
    color: 'black',
    fontSize: 18,
    marginHorizontal: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  logoutButton: {
    marginTop: 20,
    color: 'black',
  },
  ppreviewModalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width - 0,
    height: Dimensions.get('window').height / 2,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor:'black',
  },
 
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop:-30,
 
  },
  dateButton: {
    backgroundColor: 'white',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  buttonText: {
    color: 'blue',
    fontSize: 14,
  },
  iconContainer: {
    backgroundColor: 'white',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
 
  buttonSpacer: {
    width: 15,
  },
  selectionOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionText: {
    color: 'white',
    fontSize: 18,
  },
  selectionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'grey',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  footerButton: {
    marginHorizontal: 120,
    alignItems: 'center',
  },
  footerButtonText: {
    color: 'blue',
    fontSize: 18,
  },
  shareButton: {
    alignItems: 'flex-end',
  },
  selectionHeaderContainer: {
    backgroundColor: 'white',
    padding: 10,
  },
  selectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionHeaderText: {
    color: 'blue',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#ff4444',
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'grey',
    bottom: 0,
    left: 0,
    right: 0,
  },
 
 
  buttonTextModal: {
    fontSize: 16,
    color: 'blue',
    padding: 10,
  },
  modalHeader: {
    position: 'absolute',
    top: '5%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
      },
 
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  toastText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
});
 
export default FloatingActionButton;