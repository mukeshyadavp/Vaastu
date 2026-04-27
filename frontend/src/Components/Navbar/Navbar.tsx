import { useState } from "react";
import "./Navbar.css";

import Header from "./components/Header";
import MenuBar from "./components/MenuBar";
import ApplyModal from "./components/ApplyModal";
import BuildingPermissionModal from "./components/BuildingPermissionModal";
import FormWizard from "./components/FormWizard";

type NavbarProps = {
  fetchApplications?: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bpOpen: boolean;
  setBpOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  applyOpen: boolean;
  setApplyOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar: React.FC<NavbarProps> = ({
  fetchApplications = () => {},
  open,
  bpOpen,
  setBpOpen,
  formOpen,
  setFormOpen,
  applyOpen,
  setApplyOpen,
}) => {
  const [permissionType, setPermissionType] = useState("");

  const handleBuildingPermissionOpen = () => {
    setApplyOpen(false);
    setBpOpen(true);
  };

  const handlePermissionContinue = () => {
    if (permissionType === "new") {
      setBpOpen(false);
      setFormOpen(true);
      return;
    }

    alert("Please select New to continue");
  };

  return (
    <div>
      <Header />

      <MenuBar />

      <hr />

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onBuildingPermission={handleBuildingPermissionOpen}
      />

      <BuildingPermissionModal
        open={bpOpen}
        type={permissionType}
        setType={setPermissionType}
        onClose={() => setBpOpen(false)}
        onContinue={handlePermissionContinue}
      />

      <FormWizard
        open={formOpen}
        setOpen={setFormOpen}
        fetchApplications={fetchApplications}
        lockBodyScroll={open || bpOpen || formOpen || applyOpen}
      />
    </div>
  );
};

export default Navbar;