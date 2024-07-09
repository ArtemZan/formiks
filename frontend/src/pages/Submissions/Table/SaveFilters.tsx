import { Button, IconButton } from '@chakra-ui/react';
import { IoSave } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { RestAPI } from '../../../api/rest';
import Toast from '../../../components/Toast';
import { Template } from '../../../types/template';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Input,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

interface Props {
    selectedTemplate: string;
    displayedColumns: any;
    filters: any;
    presetName: string,
    setPresetName: Function,
    fetchTemplates: Function
}

export default function SaveFilters(props: Props) {
    const { selectedTemplate, displayedColumns, filters } = props;
    const [popupOpen, setPopupOpen] = useState<boolean>(false);
    const cancelRef = useRef(null);

    const openPopup = () => setPopupOpen(true);
    const closePopup = () => setPopupOpen(false);

    const onConfirm = async () => {
        try {
            var template: Template = {
                name: props.presetName,
                columns: displayedColumns,
                filters,
            };
            RestAPI.createTemplate(template).then(() => {
                toast(
                    <Toast
                        title={'Preset updated'}
                        message={
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: 'Preset successfully saved',
                                }}
                            />
                        }
                        type={'success'}
                    />
                );
                props.fetchTemplates();
                closePopup();
            });
        } catch (err) {
            console.log(err);
            
        }
    };

    // if(cancelRef?.current === undefined) {
    //     cancelRef.current = null;
    // }

    return (
        <>
            <IconButton
                icon={<IoSave />}
                // isDisabled={
                //     selectedTemplate === 'local'
                //     currentUser.displayName === "unknown"
                // }
                onClick={openPopup}
                aria-label="save"
                colorScheme="blue"
                mr="10px"
            />
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={closePopup}
                isOpen={popupOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Save presets</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        <Input
                            onChange={(e) => props.setPresetName(e.target.value)}
                            placeholder="Preset name"
                            size="sm"
                        />
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="red"
                            ref={cancelRef}
                            onClick={closePopup}
                        >
                            No
                        </Button>
                        <Button ml={3} disabled={!props.presetName} onClick={onConfirm}>
                            Yes
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
