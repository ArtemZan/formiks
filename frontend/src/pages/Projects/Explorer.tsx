import { AddIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Center,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [createBookmarkModal, setCreateBookMarkModal] = useState(false);

  useEffect(() => {
    RestAPI.getBookmarks().then((response) => setBookmarks(response.data));
    RestAPI.getProjects().then((response) => {
      setProjects(response.data);
    });
  }, []);

  return (
    <div>
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
                  <WrapItem>
                    <Tag
                      fontWeight={"400"}
                      size={"lg"}
                      // colorScheme="cyan"
                      cursor="pointer"
                      id={bookmark.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        console.log(bookmark.id);
                        if (bookmark.id) {
                          RestAPI.deleteBookmark(bookmark.id);
                          setBookmarks(
                            bookmarks.filter((b) => b.id !== bookmark.id)
                          );
                        }
                      }}
                      onClick={() => {
                        // FIXME: filter projects
                        console.log(bookmark.tags);
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
              colorScheme="cyan"
              fontWeight={"400"}
              size={"lg"}
              cursor="pointer"
            >
              <AddIcon w={3} h={3} />
            </Tag>
          </WrapItem>
        </Wrap>
      </Center>
      <Wrap justify="center" spacing={{ base: "40px", lg: "3em" }}>
        {projects.map((project) => {
          return (
            <WrapItem>
              <ProjectCard history={props.history} project={project} />
            </WrapItem>
          );
        })}
      </Wrap>
    </div>
  );
}

export default Explorer;
