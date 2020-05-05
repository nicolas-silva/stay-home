"use strict";

import { StyleSheet } from "react-native";

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  listContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 10,
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    margin: 30,
    alignSelf: "center",
  },
  text: {
    fontSize: 15,
    alignSelf: "center",
  },
  menu: {
    flex: 0.1,
    width: 300,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  logo: {
    width: 305,
    height: 159,
    marginBottom: 10,
  },
  welcome: {
    color: "#888",
    fontSize: 18,
    marginHorizontal: 15,
    textAlign: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    alignSelf: "center",
  },
  buttonTextRegister: {
    fontSize: 18,
    color: "white",
    alignSelf: "center",
    padding: 10,
  },
  button: {
    height: 36,
    backgroundColor: "#080808",
    borderColor: "#080808",
    borderWidth: 0,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  buttonDisabled: {
    height: 36,
    backgroundColor: "#edebe7",
    borderColor: "#edebe7",
    borderWidth: 0,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  modal: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#080808",
    borderRadius: 50,
    width: '100%',
  },
  modalInfo: {
    alignSelf: 'center',
    justifyContent: "center",
    margin: 20,
  },
  modalText: {
    fontSize: 20,
    alignSelf: "center",
    marginBottom: 10,
    textAlign: "center"
  },
  helpText: {
    fontSize: 12,
    marginLeft: 3,
    marginBottom: 25,
  },
  label: {
    textDecorationColor: "#000000",
    fontSize: 17,
    marginLeft: 3,
    marginBottom: 7,
  },
  addressField: {
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    marginBottom: 5,
  },
  addressText: {
    textDecorationColor: "#000000",
    fontSize: 17,
    marginLeft: 3,
    marginBottom: 7,
  },
  search: {
    flex: 5,
    marginBottom: 10,
    height: 40,
  },
  scroll: {
    marginTop: 10,
  },
  modalAdd: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  image:{ 
    width: '100%', 
    height: '50%', 
    borderRadius: 4
  }
});

module.exports = styles;
