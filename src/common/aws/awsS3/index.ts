import awsS3Public from './awsS3Public';
import awsS3Private from './awsS3Private';

export const awsS3 = {
  private: awsS3Private,
  public: awsS3Public,
};

export default awsS3;
