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
import DropdownCard from "../../components/DropdownCard";
import Bookmark from "../../types/bookmark";
import Dropdown from "../../types/dropdown";
import Project from "../../types/project";

interface Props {
  history: any;
  isAdmin: boolean;
}

export function Explorer(props: Props) {
  const [dropdowns, setDropdowns] = useState<Dropdown[]>([]);

  useEffect(() => {
    RestAPI.getDropdowns().then((response) => setDropdowns(response.data));
  }, []);

  return (
    <div>
      <Wrap justify="center" spacing={{ base: "40px", lg: "3em" }}>
        {(dropdowns !== null ? dropdowns : []).map((dropdown) => {
          return (
            <WrapItem>
              <DropdownCard history={props.history} dropdown={dropdown} />
            </WrapItem>
          );
        })}
      </Wrap>
    </div>
  );
}

export default Explorer;
