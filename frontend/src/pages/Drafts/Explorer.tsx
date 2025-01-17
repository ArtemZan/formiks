import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Text,
  AccordionIcon,
  VStack,
  Heading,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RestAPI } from "../../api/rest";
import Project from "../../types/project";
import moment from "moment";
import { Submission } from "../../types/submission";

interface Props {
  history: any;
  isAdmin: boolean;
}

export function Explorer(props: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [drafts, setDrafts] = useState<Submission[]>([]);

  useEffect(() => {
    RestAPI.getProjects().then((response) => {
      setProjects(response.data);
    });
    RestAPI.getDrafts().then((response) => {
      setDrafts(
        response.data.sort(
          (a, b) =>
            Number((b.data ?? {})._rejected ?? false) -
            Number((a.data ?? {})._rejected ?? false)
        )
      );
    });
  }, []);

  return (
    <div>
      <Accordion allowMultiple>
        {projects.map((project) => {
          var pd = drafts.filter((draft) => draft.project === project.id);
          return (
            <AccordionItem key={project.id}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {project.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {pd.length > 0 ? (
                  <VStack w="100%" spacing={"1.5em"}>
                    {pd.map((draft, index) => {
                      return (
                        <Box
                          key={draft.id}
                          bg={draft.data._rejected ? "red.50" : "white"}
                          _dark={{ bg: "#21252A" }}
                          w="100%"
                          p="15px"
                        >
                          <Box w="100%" h="60px">
                            <Heading size="lg" float="left">
                              <HStack spacing={"1.5em"}>
                                <Text>
                                  {draft.data.requestorsCompanyName} (
                                  {draft.data.campaignName}) #
                                  {pd.length - index}
                                </Text>
                                <Tag
                                  size={"lg"}
                                  colorScheme={"red"}
                                  display={
                                    draft.data._rejected ? "grid" : "none"
                                  }
                                >
                                  Rejected
                                </Tag>
                              </HStack>
                            </Heading>
                            <HStack float="right">
                              <IconButton
                                colorScheme="blue"
                                aria-label="edit"
                                icon={<EditIcon />}
                                onClick={() => {
                                  props.history.push(
                                    "/drafts/view/" + draft.id
                                  );
                                }}
                              />

                              <IconButton
                                colorScheme="red"
                                aria-label="delete"
                                icon={<DeleteIcon />}
                                onClick={() => {
                                  var temp = [...drafts];
                                  RestAPI.deleteDraft(draft.id || "");
                                  var i = temp.findIndex(
                                    (dr) => dr.id === draft.id
                                  );
                                  temp.splice(i, 1);

                                  setDrafts(temp);
                                }}
                              />
                            </HStack>
                          </Box>
                          <Box w="100%">
                            <VStack align={"start"} w="100%">
                              <p>
                                Requestor`s Company Name:{" "}
                                {draft.data.requestorsCompanyName}
                              </p>
                              <p>
                                Organizing Company:{" "}
                                {draft.data.organizingCompany}
                              </p>
                              <p>Campaign Name: {draft.data.campaignName}</p>
                              <p>Project Number: {draft.data.projectNumber}</p>
                              <p>Comments: {draft.data.comments}</p>
                            </VStack>
                            <VStack float="right">
                              <p>
                                Saved:{" "}
                                {moment(draft.created).format(
                                  "DD.MM.YYYY HH:mm"
                                )}
                              </p>
                              <p>Author: {draft.author}</p>
                            </VStack>
                          </Box>
                        </Box>
                      );
                    })}
                  </VStack>
                ) : (
                  "No drafts saved"
                )}
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default Explorer;
