import DigitalTwinWarehouse
from "../components/DigitalTwinWarehouse/DigitalTwinWarehouse";

function Warehouse() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Warehouse Intelligence Center
      </h1>

      <DigitalTwinWarehouse />

    </div>
  );
}

export default Warehouse;