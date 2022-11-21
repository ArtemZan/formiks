import { AddIcon } from "@chakra-ui/icons";
import { Center, Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RestAPI } from "../../api/rest";
import CreateBookmark from "../../components/CreateBookmark";
import ProjectCard from "../../components/ProjectCard";
import Bookmark from "../../types/bookmark";
import Project from "../../types/project";

interface Props {
  history: any;
  isAdmin: boolean;
}

export function Explorer(props: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedBookmark, setSelectedBookmark] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [createBookmarkModal, setCreateBookMarkModal] = useState(false);

  useEffect(() => {
    RestAPI.getBookmarks().then((response) => setBookmarks(response.data));
    RestAPI.getProjects().then((response) => {
      setProjects(response.data);
      setFilteredProjects(response.data);
    });
  }, []);

  return (
    <div style={{ paddingBottom: "3em" }}>
      <CreateBookmark
        isOpen={createBookmarkModal}
        addBookmark={(bookmark: Bookmark) => {
          setBookmarks((old) => [...(old ? old : []), bookmark]);
        }}
        bookmarks={bookmarks}
        onClose={() => {
          setCreateBookMarkModal(false);
        }}
        projects={projects}
      />
      <Center mb={"5em"}>
        <Wrap maxW={{ base: "100%", lg: "50%" }} justify="center">
          {bookmarks
            ? bookmarks.map((bookmark) => {
                return (
                  <WrapItem key={`bookmark-${bookmark.id}`}>
                    <Tag
                      fontWeight={"400"}
                      size={"lg"}
                      colorScheme={
                        selectedBookmark === bookmark.id ? "cyan" : undefined
                      }
                      cursor="pointer"
                      key={bookmark.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (bookmark.id) {
                          RestAPI.deleteBookmark(bookmark.id);
                          setBookmarks(
                            bookmarks.filter((b) => b.id !== bookmark.id)
                          );
                        }
                      }}
                      onClick={() => {
                        setSelectedBookmark(
                          selectedBookmark !== bookmark.id ? bookmark.id! : ""
                        );
                        setFilteredProjects(
                          selectedBookmark !== bookmark.id
                            ? projects.filter((project) =>
                                project.tags.some((t) =>
                                  bookmark.tags.includes(t)
                                )
                              )
                            : projects
                        );
                      }}
                    >
                      {bookmark.title}
                    </Tag>
                  </WrapItem>
                );
              })
            : null}

          <WrapItem display={props.isAdmin ? "grid" : "none"}>
            <Tag
              onClick={() => {
                setCreateBookMarkModal(true);
              }}
              fontWeight={"400"}
              size={"lg"}
              cursor="pointer"
            >
              <AddIcon w={3} h={3} />
            </Tag>
          </WrapItem>
        </Wrap>
      </Center>
      <Wrap
        justify="center"
        spacing={{ base: "40px", lg: "3em" }}
        mx={{ base: 0, "2xl": "300px" }}
      >
        {filteredProjects.map((project) => {
          return (
            <WrapItem key={`wrap-${project.id}`}>
              <ProjectCard history={props.history} project={project} />
            </WrapItem>
          );
        })}
      </Wrap>
    </div>
  );
}

export default Explorer;
