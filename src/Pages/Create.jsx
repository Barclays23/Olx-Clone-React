import React, { Fragment } from 'react';

import Navbar from '../Components/Navbar/Navbar';
import CreateForm from '../Components/Create/CreateForm';

const CreatePage = () => {
  return (
    <Fragment>
      <Navbar />
      <CreateForm/>
    </Fragment>
  );
};

export default CreatePage;
