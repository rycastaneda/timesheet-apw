import styled from "styled-components";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface ImportButtonProps {
  onImport: (json: string) => void;
  disabled: boolean;
}

export default function ImportButton({
  onImport,
  disabled,
}: ImportButtonProps) {
  // eslint-disable-next-line
  const onInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.value = "";
  };

  const handleConvert: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet);
        const jsondata = JSON.stringify(json, null, 2);
        onImport(jsondata);
      };

      reader.readAsBinaryString(file);
    }
  };

  return (
    <Button
      disabled={disabled}
      component="label"
      variant="outlined"
      tabIndex={-1}
      className="custom-file-upload"
    >
      Import
      <VisuallyHiddenInput
        type="file"
        onChange={handleConvert}
        onClick={onInputClick}
      />
    </Button>
  );
}
