export default function useScrollToSongID() {
  const scrollToSongID = (id: number) => {
    console.log("Auto scrolling to song id: ", id);
    const elem = document.getElementById(id.toString());
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  return scrollToSongID;
}
