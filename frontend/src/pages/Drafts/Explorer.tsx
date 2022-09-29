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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Text,
  AccordionIcon,
  VStack,
  Heading,
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
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Local One Vendor
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack w="100%" spacing={"1.5em"}>
              <Box bg="white" w="100%" p="15px">
                <Box w="100%" h="60px">
                  <Heading size="lg" float="left">
                    request name (campaign name) #2
                  </Heading>
                  <Button
                    colorScheme={"blue"}
                    float="right"
                    onClick={() => {
                      window.open(
                        "/drafts/view/" + "63203b5e0fd5126299e1f3d7",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    Continue
                  </Button>
                </Box>
                <Box w="100%">
                  <VStack align={"start"} w="100%">
                    <p>Requestor`s Company Name: Company Name</p>
                    <p>Organizing Company: Company</p>
                    <p>Campaign Name: Campaign</p>
                    <p>Project Number: pn</p>
                    <p>Comments: comment</p>
                  </VStack>
                  <VStack float="right">
                    <p>Saved: 28.09.2022 14:06</p>
                    <p>Author: Sergejs Podolaks</p>
                  </VStack>
                </Box>
              </Box>
              <Box bg="white" w="100%" p="15px">
                <Box w="100%" h="60px">
                  <Heading size="lg" float="left">
                    request name (campaign name) #1
                  </Heading>
                  <Button colorScheme={"blue"} float="right">
                    Continue
                  </Button>
                </Box>
                <Box w="100%">
                  <VStack align={"start"} w="100%">
                    <p>Requestor`s Company Name: Company Name</p>
                    <p>Organizing Company: Company</p>
                    <p>Campaign Name: Campaign</p>
                    <p>Project Number: pn</p>
                    <p>Comments: comment</p>
                  </VStack>
                  <VStack float="right">
                    <p>Saved: 28.09.2022 15:30</p>
                    <p>Author: Sergejs Podolaks</p>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Local Multi Vendor
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>No drafts saved</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default Explorer;
