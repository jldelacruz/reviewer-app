// components/MicBottomSheet.js
import React, {
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { IconButton } from "react-native-paper";

const MicBottomSheet = forwardRef((props, ref) => {
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["40%"], []);

  // expose open/close to parent
  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
    close: () => sheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ borderRadius: 24 }}
    >
      <View style={styles.container}>
        {/* Mascot */}
        <View style={styles.mascot}>
          <Text style={{ fontSize: 40 }}>👻</Text>
          <Text style={styles.listeningText}>I'm listening...</Text>
        </View>

        {/* Mic Button */}
        <IconButton
          icon="microphone"
          size={40}
          mode="contained"
          containerColor="#FFB6C8"
          iconColor="white"
          onPress={props.onPressMic}
        />
      </View>
    </BottomSheetModal>
  );
});

export default MicBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  mascot: {
    alignItems: "center",
    marginBottom: 20,
  },
  listeningText: {
    marginTop: 6,
    fontSize: 16,
    color: "#444",
  },
});
